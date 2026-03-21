# frozen_string_literal: true

class LicenseMailer < ApplicationMailer
  def expiry_alert(user, license, days_remaining)
    @user = user
    @license = license
    @days_remaining = days_remaining

    mail(
      to: user.email,
      subject: "License Expiry Alert: #{license.software_name} expires in #{days_remaining} days",
    )
  end
end
