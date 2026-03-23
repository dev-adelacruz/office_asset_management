# frozen_string_literal: true

class Users::PersistEmailChangeRequestInteractor
  include Interactor

  # Reads:  context.target_user, context.new_email
  # Writes: nothing (saves pending_email + hashed token, sends confirmation email)

  def call
    raw_token = SecureRandom.urlsafe_base64
    hashed_token = Digest::SHA256.hexdigest(raw_token)

    context.target_user.update!(
      pending_email: context.new_email,
      email_confirmation_token: hashed_token,
      email_confirmation_sent_at: Time.current
    )

    UserMailer.email_confirmation(context.target_user, raw_token).deliver_later
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
