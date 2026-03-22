# frozen_string_literal: true

class Users::PersistProfileInteractor
  include Interactor

  # Reads:  context.target_user, context.profile_params
  # Writes: context.target_user (updated)

  def call
    context.target_user.update!(context.profile_params)
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
