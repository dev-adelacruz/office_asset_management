# frozen_string_literal: true

class Users::ValidateEmailConfirmationTokenInteractor
  include Interactor

  TOKEN_EXPIRY = 24.hours

  # Reads:  context.token (raw token from URL param)
  # Writes: context.user (the user record matching the token)

  def call
    if context.token.blank?
      context.fail!(message: "Confirmation token is missing.")
      return
    end

    hashed = Digest::SHA256.hexdigest(context.token)
    user = User.find_by(email_confirmation_token: hashed)

    if user.nil?
      context.fail!(message: "Invalid confirmation token.")
      return
    end

    if user.email_confirmation_sent_at < TOKEN_EXPIRY.ago
      context.fail!(message: "Confirmation token has expired. Please request a new one.")
      return
    end

    context.user = user
  end
end
