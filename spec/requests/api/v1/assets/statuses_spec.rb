# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Asset Statuses' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }
  let(:asset) { create(:asset, status: :available) }

  describe '#update' do
    path '/api/v1/assets/{asset_id}/status' do
      patch 'updates asset status' do
        tags 'Asset Statuses'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :asset_id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          required: %w[status],
          properties: {
            status: {
              type: :string,
              enum: %w[available assigned under_maintenance retired lost]
            }
          }
        }

        response(200, 'manager updates status successfully') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'assigned' } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:asset][:status]).to eq 'assigned'
          end
        end

        response(200, 'executive updates status successfully') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'under_maintenance' } }

          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :ok
          end
        end

        response(200, 'marks asset as lost') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'lost' } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:asset][:status]).to eq 'lost'
          end
        end

        response(200, 'marks asset as retired') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'retired' } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:asset][:status]).to eq 'retired'
          end
        end

        response(200, 'logs the status change') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'assigned' } }

          before { sign_in manager }

          run_test! do |_response|
            log = AssetStatusLog.last
            expect(log.asset).to eq asset
            expect(log.changed_by).to eq manager
            expect(log.from_status).to eq 'available'
            expect(log.to_status).to eq 'assigned'
          end
        end

        response(403, 'employee cannot update status') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'assigned' } }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
            expect(json_response[:message]).to eq 'Forbidden. Insufficient permissions.'
          end
        end

        response(404, 'asset not found') do
          let(:asset_id) { 0 }
          let(:params) { { status: 'assigned' } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(422, 'invalid status value') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'broken' } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(401, 'unauthenticated') do
          let(:asset_id) { asset.id }
          let(:params) { { status: 'assigned' } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
