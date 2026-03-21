# frozen_string_literal: true

class LicenseExpiryCheckJob < ApplicationJob
  queue_as :default

  THRESHOLDS = [
    { days: 60, type: "expiry_60", column: :notify_at_60_days },
    { days: 30, type: "expiry_30", column: :notify_at_30_days },
    { days: 7,  type: "expiry_7",  column: :notify_at_7_days }
  ].freeze

  def perform
    recipients = User.where(role: %w[manager executive]).to_a
    return if recipients.empty?

    now = Time.current

    THRESHOLDS.each do |threshold|
      licenses = License
        .where(expiry_date: Date.today + threshold[:days])
        .where(threshold[:column] => true)
      next if licenses.empty?

      already_notified_ids = Notification
        .where(notifiable_type: "License", notifiable_id: licenses.map(&:id), notification_type: threshold[:type])
        .where("DATE(created_at) = ?", Date.today)
        .pluck(:notifiable_id)
        .to_set

      notifications = []

      licenses.each do |license|
        next if already_notified_ids.include?(license.id)

        title = "License expiring in #{threshold[:days]} days"
        body = "#{license.software_name} (#{license.vendor}) expires on #{license.expiry_date.strftime('%b %d, %Y')}."

        recipients.each do |user|
          notifications << {
            user_id: user.id,
            notifiable_type: "License",
            notifiable_id: license.id,
            notification_type: threshold[:type],
            title: title,
            body: body,
            read_at: nil,
            created_at: now,
            updated_at: now
          }
          LicenseMailer.expiry_alert(user, license, threshold[:days]).deliver_later
        end
      end

      Notification.insert_all(notifications) if notifications.any?
    end
  end
end
