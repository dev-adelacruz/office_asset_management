# frozen_string_literal: true

class Api::V1::NotificationsController < Api::BaseController
  before_action :set_notification, only: [ :update ]

  def index
    notifications = current_user.notifications.recent.limit(20)
    render json: {
      status: {
        code: 200,
        message: "Notifications retrieved successfully.",
        data: {
          notifications: NotificationBlueprint.render_as_hash(notifications),
          unread_count: current_user.notifications.unread.count
        }
      }
    }, status: :ok
  end

  def update
    @notification.mark_as_read!
    render json: {
      status: {
        code: 200,
        message: "Notification marked as read.",
        data: { notification: NotificationBlueprint.render_as_hash(@notification) }
      }
    }, status: :ok
  end

  private

  def set_notification
    @notification = current_user.notifications.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { status: 404, message: "Notification not found." }, status: :not_found
  end
end
