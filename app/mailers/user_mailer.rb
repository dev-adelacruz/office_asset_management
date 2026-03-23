# frozen_string_literal: true

class UserMailer < ApplicationMailer
  def email_confirmation(user, token)
    @user = user
    @confirmation_url = "#{ENV.fetch('FRONTEND_URL', 'http://localhost:3000')}/confirm-email?token=#{token}"

    mail(
      to: user.pending_email,
      subject: "Confirm your new email address"
    )
  end
end
