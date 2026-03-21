# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Audit Logs" do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:executive) { create(:user, :executive) }
  let(:manager) { create(:user, :manager) }
  let(:asset) { create(:asset) }

  describe "#index" do
    path "/api/v1/audit_logs" do
      get "lists audit logs" do
        tags "Audit Logs"
        security [ bearerAuth: [] ]

        parameter name: :actor_id, in: :query, type: :integer, required: false
        parameter name: :action_type, in: :query, type: :string, required: false
        parameter name: :auditable_type, in: :query, type: :string, required: false
        parameter name: :from_date, in: :query, type: :string, required: false
        parameter name: :to_date, in: :query, type: :string, required: false
        parameter name: :page, in: :query, type: :integer, required: false
        parameter name: :per_page, in: :query, type: :integer, required: false

        response(200, "returns audit logs for executive") do
          before do
            create(:audit_log, actor: executive, auditable: asset, action: "create")
            create(:audit_log, actor: manager, auditable: asset, action: "update",
                   changes_before: { "name" => "Old" }, changes_after: { "name" => "New" })
            sign_in executive
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:audit_logs].length).to eq 2
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:total_count]).to eq 2
            expect(pagination[:current_page]).to eq 1
            expect(pagination[:per_page]).to eq 25
          end
        end

        response(200, "filters by actor_id") do
          let(:actor_id) { executive.id }

          before do
            create(:audit_log, actor: executive, auditable: asset, action: "create")
            create(:audit_log, actor: manager, auditable: asset, action: "update",
                   changes_before: { "name" => "Old" }, changes_after: { "name" => "New" })
            sign_in executive
          end

          run_test! do |response|
            expect(json_response[:status][:data][:audit_logs].length).to eq 1
            expect(json_response[:status][:data][:audit_logs].first[:action]).to eq "create"
          end
        end

        response(200, "filters by action_type") do
          let(:action_type) { "update" }

          before do
            create(:audit_log, actor: executive, auditable: asset, action: "create")
            create(:audit_log, actor: manager, auditable: asset, action: "update",
                   changes_before: { "name" => "Old" }, changes_after: { "name" => "New" })
            sign_in executive
          end

          run_test! do |response|
            expect(json_response[:status][:data][:audit_logs].length).to eq 1
            expect(json_response[:status][:data][:audit_logs].first[:action]).to eq "update"
          end
        end

        response(200, "filters by date range") do
          let(:from_date) { Date.today.to_s }
          let(:to_date) { Date.today.to_s }

          before do
            create(:audit_log, actor: executive, auditable: asset, action: "create")
            sign_in executive
          end

          run_test! do |response|
            expect(json_response[:status][:data][:audit_logs].length).to eq 1
          end
        end

        response(200, "paginates results") do
          let(:page) { 2 }
          let(:per_page) { 1 }

          before do
            create(:audit_log, actor: executive, auditable: asset, action: "create")
            create(:audit_log, actor: manager, auditable: asset, action: "update")
            sign_in executive
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]
            expect(data[:audit_logs].length).to eq 1
            pagination = data[:pagination]
            expect(pagination[:current_page]).to eq 2
            expect(pagination[:total_pages]).to eq 2
            expect(pagination[:total_count]).to eq 2
            expect(pagination[:per_page]).to eq 1
          end
        end

        response(403, "forbidden for non-executive") do
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
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
end
