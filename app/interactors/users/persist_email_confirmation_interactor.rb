# frozen_string_literal: true

class Users::PersistEmailConfirmationInteractor
  include Interactor

  # Reads:  context.user (set by ValidateEmailConfirmationTokenInteractor)
  # Writes: nothing (applies pending_email → email, clears pending fields)

  def call
    context.user.update!(
      email: context.user.pending_email,
      pending_email: nil,
      email_confirmation_token: nil,
      email_confirmation_sent_at: nil
    )
  rescue ActiveRecord::RecordInvalid => e
    context.fail!(message: e.record.errors.full_messages.join(", "))
  end
end
