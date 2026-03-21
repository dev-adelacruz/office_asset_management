# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Notifications" do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:employee) { create(:user, :employee) }
  let(:license) { create(:license) }

  describe "#index" do
    path "/api/v1/notifications" do
      get "lists notifications for current user" do
        tags "Notifications"
        security [ bearerAuth: [] ]

        response(200, "returns notifications with unread count") do
          before do
            create(:notification, user: manager, notifiable: license)
            create(:notification, user: manager, notifiable: license, notification_type: "expiry_7", read_at: Time.current)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:notifications].length).to eq 2
            expect(json_response[:status][:data][:unread_count]).to eq 1
          end
        end

        response(200, "only returns current user notifications") do
          before do
            create(:notification, user: employee, notifiable: license)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:notifications]).to be_empty
          end
        end

        response(401, "unauthenticated") do
          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe "#update" do
    path "/api/v1/notifications/{id}" do
      parameter name: :id, in: :path, type: :integer

      patch "marks a notification as read" do
        tags "Notifications"
        security [ bearerAuth: [] ]

        response(200, "marks notification as read") do
          let(:notification) { create(:notification, user: manager, notifiable: license) }
          let(:id) { notification.id }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:notification][:read]).to be true
            expect(notification.reload.read_at).not_to be_nil
          end
        end

        response(404, "notification not found") do
          let(:id) { 0 }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(404, "cannot mark another user's notification as read") do
          let(:other_notif) { create(:notification, user: employee, notifiable: license) }
          let(:id) { other_notif.id }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, "unauthenticated") do
          let(:id) { 1 }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
