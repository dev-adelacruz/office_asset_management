# frozen_string_literal: true

class NotificationBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :body, :notification_type, :notifiable_type, :notifiable_id, :read_at, :created_at

  field :read do |notification|
    notification.read?
  end
end
