# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Asset Assignment Logs' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }
  let(:asset) { create(:asset) }

  describe '#index' do
    path '/api/v1/assets/{asset_id}/assignment_logs' do
      get 'lists assignment history for an asset' do
        tags 'Asset Assignment Logs'
        security [ bearerAuth: [] ]
        parameter name: :asset_id, in: :path, type: :integer

        response(200, 'manager views assignment history') do
          let(:asset_id) { asset.id }
          before do
            create(:asset_assignment_log, asset: asset, returned_at: 2.days.ago)
            create(:asset_assignment_log, asset: asset)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            logs = json_response[:status][:data][:assignment_logs]
            expect(logs.length).to eq 2
            expect(logs.first.keys).to include(:assigned_to, :assigned_by, :assigned_at, :returned_at)
          end
        end

        response(200, 'employee can view assignment history') do
          let(:asset_id) { asset.id }
          before do
            create(:asset_assignment_log, asset: asset)
            sign_in employee
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:assignment_logs].length).to eq 1
          end
        end

        response(404, 'asset not found') do
          let(:asset_id) { 0 }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:asset_id) { asset.id }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#create' do
    path '/api/v1/assets/{asset_id}/assignment_logs' do
      post 'assigns an asset to a user' do
        tags 'Asset Assignment Logs'
        security [ bearerAuth: [] ]
        consumes 'application/json'
        parameter name: :asset_id, in: :path, type: :integer
        parameter name: :body, in: :body, schema: { type: :object }

        response(201, 'manager assigns asset to employee') do
          let(:asset_id) { asset.id }
          let(:body) do
            {
              assignment_log: {
                assigned_to_id: employee.id,
                assigned_at: Time.current.iso8601,
                notes: 'Assigned for onboarding'
              }
            }
          end
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :created
            data = json_response[:status][:data][:assignment_log]
            expect(data[:assigned_to][:id]).to eq employee.id
            expect(data[:assigned_by][:id]).to eq manager.id
            expect(data[:notes]).to eq 'Assigned for onboarding'
            expect(asset.reload.status).to eq 'assigned'
          end
        end

        response(422, 'missing required fields') do
          let(:asset_id) { asset.id }
          let(:body) { { assignment_log: {} } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(403, 'employee cannot assign assets') do
          let(:asset_id) { asset.id }
          let(:body) { { assignment_log: { assigned_to_id: employee.id, assigned_at: Time.current.iso8601 } } }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'asset not found') do
          let(:asset_id) { 0 }
          let(:body) { { assignment_log: { assigned_to_id: employee.id, assigned_at: Time.current.iso8601 } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:asset_id) { asset.id }
          let(:body) { {} }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#update' do
    let(:open_log) { create(:asset_assignment_log, asset: asset) }

    path '/api/v1/assets/{asset_id}/assignment_logs/{id}' do
      patch 'records a return for an assignment' do
        tags 'Asset Assignment Logs'
        security [ bearerAuth: [] ]
        parameter name: :asset_id, in: :path, type: :integer
        parameter name: :id, in: :path, type: :integer

        response(200, 'manager records asset return') do
          let(:asset_id) { asset.id }
          let(:id) { open_log.id }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data][:assignment_log]
            expect(data[:returned_at]).not_to be_nil
            expect(asset.reload.status).to eq 'available'
          end
        end

        response(422, 'already returned') do
          let(:asset_id) { asset.id }
          let(:id) { create(:asset_assignment_log, asset: asset, returned_at: 1.day.ago).id }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to include 'already been returned'
          end
        end

        response(403, 'employee cannot record returns') do
          let(:asset_id) { asset.id }
          let(:id) { open_log.id }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'log not found') do
          let(:asset_id) { asset.id }
          let(:id) { 0 }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:asset_id) { asset.id }
          let(:id) { open_log.id }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
