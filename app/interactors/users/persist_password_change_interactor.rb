# frozen_string_literal: true

class Users::PersistPasswordChangeInteractor
  include Interactor

  # Reads:  context.target_user, context.new_password
  # Writes: nothing (saves new encrypted_password + fresh jti to invalidate current JWT)

  def call
    context.target_user.assign_attributes(
      password: context.new_password,
      jti: SecureRandom.uuid
    )
    context.target_user.save!
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
