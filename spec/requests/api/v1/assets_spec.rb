# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Assets' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }

  let(:valid_params) do
    {
      asset: {
        name: 'MacBook Pro 14"',
        category: 'laptop',
        serial_number: 'SN-ABC123456',
        purchase_date: '2026-01-15',
        purchase_cost: 2499.99,
        condition: 'brand_new',
        manufacturer: 'Apple',
        model: 'MBP14',
        location: 'Manila HQ'
      }
    }
  end

  describe '#index' do
    path '/api/v1/assets' do
      get 'lists all assets' do
        tags 'Assets'
        security [ bearerAuth: [] ]

        response(200, 'returns all assets') do
          before do
            create_list(:asset, 3)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:assets].length).to eq 3
          end
        end

        response(401, 'unauthenticated') do
          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#update' do
    let(:asset) { create(:asset) }

    path '/api/v1/assets/{id}' do
      patch 'updates an asset' do
        tags 'Assets'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            asset: {
              type: :object,
              properties: {
                name: { type: :string },
                category: { type: :string, enum: %w[laptop monitor peripheral furniture other] },
                serial_number: { type: :string },
                purchase_date: { type: :string, format: :date },
                purchase_cost: { type: :number },
                condition: { type: :string, enum: %w[brand_new good fair poor] },
                manufacturer: { type: :string },
                model: { type: :string },
                warranty_expiry: { type: :string, format: :date },
                location: { type: :string },
                notes: { type: :string }
              }
            }
          }
        }

        response(200, 'manager updates asset successfully') do
          let(:id) { asset.id }
          let(:params) { { asset: { name: 'Updated Name', location: 'Cebu Office' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:asset]).to include(
              name: 'Updated Name',
              location: 'Cebu Office'
            )
          end
        end

        response(200, 'executive updates asset successfully') do
          let(:id) { asset.id }
          let(:params) { { asset: { notes: 'Needs inspection' } } }

          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :ok
          end
        end

        response(403, 'employee cannot update asset') do
          let(:id) { asset.id }
          let(:params) { { asset: { name: 'Sneaky Edit' } } }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'asset not found') do
          let(:id) { 0 }
          let(:params) { { asset: { name: 'Ghost' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(422, 'invalid update params') do
          let(:id) { asset.id }
          let(:params) { { asset: { name: '' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(401, 'unauthenticated') do
          let(:id) { asset.id }
          let(:params) { { asset: { name: 'No Auth' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#create' do
    path '/api/v1/assets' do
      post 'registers a new asset' do
        tags 'Assets'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            asset: {
              type: :object,
              required: %w[name category serial_number purchase_date purchase_cost condition],
              properties: {
                name: { type: :string },
                category: { type: :string, enum: %w[laptop monitor peripheral furniture other] },
                serial_number: { type: :string },
                purchase_date: { type: :string, format: :date },
                purchase_cost: { type: :number },
                condition: { type: :string, enum: %w[brand_new good fair poor] },
                manufacturer: { type: :string },
                model: { type: :string },
                warranty_expiry: { type: :string, format: :date },
                location: { type: :string },
                notes: { type: :string }
              }
            }
          }
        }

        response(201, 'manager creates asset successfully') do
          let(:params) { valid_params }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :created
            expect(json_response[:status][:code]).to eq 201
            expect(json_response[:status][:data][:asset]).to include(
              name: 'MacBook Pro 14"',
              category: 'laptop',
              status: 'available'
            )
            expect(json_response[:status][:data][:asset][:asset_code]).to match(/\AASSET-[A-Z0-9]{6}\z/)
          end
        end

        response(201, 'executive creates asset successfully') do
          let(:params) { valid_params.deep_merge(asset: { serial_number: 'SN-XYZ999888' }) }

          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :created
          end
        end

        response(403, 'employee cannot create asset') do
          let(:params) { valid_params }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
            expect(json_response[:message]).to eq 'Forbidden. Insufficient permissions.'
          end
        end

        response(422, 'missing required fields') do
          let(:params) { { asset: { name: '' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(401, 'unauthenticated') do
          let(:params) { valid_params }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
