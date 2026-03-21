# frozen_string_literal: true

class LicenseExpiryCheckJob < ApplicationJob
  queue_as :default

  THRESHOLDS = [
    { days: 60, type: "expiry_60", column: :notify_at_60_days },
    { days: 30, type: "expiry_30", column: :notify_at_30_days },
    { days: 7,  type: "expiry_7",  column: :notify_at_7_days }
  ].freeze

  def perform
    recipients = User.where(role: %w[manager executive])
    return if recipients.empty?

    THRESHOLDS.each do |threshold|
      licenses = License
        .where(expiry_date: Date.today + threshold[:days])
        .where(threshold[:column] => true)

      licenses.each do |license|
        next if already_notified_today?(license, threshold[:type])

        title = "License expiring in #{threshold[:days]} days"
        body = "#{license.software_name} (#{license.vendor}) expires on #{license.expiry_date.strftime('%b %d, %Y')}."

        recipients.each do |user|
          Notification.create!(
            user: user,
            notifiable: license,
            notification_type: threshold[:type],
            title: title,
            body: body,
          )
          LicenseMailer.expiry_alert(user, license, threshold[:days]).deliver_later
        end
      end
    end
  end

  private

  def already_notified_today?(license, type)
    Notification
      .where(notifiable: license, notification_type: type)
      .where("DATE(created_at) = ?", Date.today)
      .exists?
  end
end
