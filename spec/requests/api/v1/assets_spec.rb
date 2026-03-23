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

        parameter name: :page, in: :query, type: :integer, required: false
        parameter name: :per_page, in: :query, type: :integer, required: false

        response(200, 'returns all assets with pagination metadata') do
          before do
            create_list(:asset, 3)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:assets].length).to eq 3
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:current_page]).to eq 1
            expect(pagination[:total_count]).to eq 3
            expect(pagination[:per_page]).to eq 25
            expect(pagination[:total_pages]).to eq 1
            summary = json_response[:status][:data][:summary]
            expect(summary).to include(:active, :available, :assigned, :under_maintenance)
          end
        end

        response(200, 'summary counts reflect full database, not current page') do
          let(:page) { 2 }
          let(:per_page) { 1 }

          before do
            create(:asset, status: :available)
            create(:asset, status: :available)
            create(:asset, status: :assigned)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:assets].length).to eq 1
            summary = json_response[:status][:data][:summary]
            expect(summary[:available]).to eq 2
            expect(summary[:assigned]).to eq 1
            expect(summary[:active]).to eq 3
          end
        end

        response(200, 'paginates results with per_page and page params') do
          let(:page) { 2 }
          let(:per_page) { 2 }

          before do
            create_list(:asset, 5)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:assets].length).to eq 2
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:current_page]).to eq 2
            expect(pagination[:total_count]).to eq 5
            expect(pagination[:total_pages]).to eq 3
            expect(pagination[:per_page]).to eq 2
          end
        end

        response(200, 'returns empty page when page exceeds total') do
          let(:page) { 99 }
          let(:per_page) { 25 }

          before do
            create_list(:asset, 2)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:assets]).to be_empty
            expect(json_response[:status][:data][:pagination][:current_page]).to eq 99
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

  describe '#index (filtered)' do
    path '/api/v1/assets' do
      get 'filters assets by query params' do
        tags 'Assets'
        security [ bearerAuth: [] ]
        parameter name: :q, in: :query, type: :string, required: false
        parameter name: :category, in: :query, type: :string, required: false
        parameter name: :status, in: :query, type: :string, required: false
        parameter name: :location, in: :query, type: :string, required: false
        parameter name: :purchase_date_from, in: :query, type: :string, required: false
        parameter name: :purchase_date_to, in: :query, type: :string, required: false

        before { sign_in manager }

        response(200, 'filters by text search') do
          before do
            create(:asset, name: 'ThinkPad X1', serial_number: 'LENOVO-001', notes: nil)
            create(:asset, name: 'MacBook Pro', serial_number: 'APPLE-001', notes: nil)
          end
          let(:q) { 'ThinkPad' }

          run_test! do
            expect(json_response[:status][:data][:assets].length).to eq 1
            expect(json_response[:status][:data][:assets].first[:name]).to eq 'ThinkPad X1'
          end
        end

        response(200, 'filters by category') do
          before do
            create(:asset, :laptop)
            create(:asset, :monitor)
          end
          let(:category) { 'monitor' }

          run_test! do
            results = json_response[:status][:data][:assets]
            expect(results.all? { |a| a[:category] == 'monitor' }).to be true
          end
        end

        response(200, 'filters by status') do
          before do
            create(:asset, :assigned)
            create(:asset)
          end
          let(:status) { 'assigned' }

          run_test! do
            results = json_response[:status][:data][:assets]
            expect(results.all? { |a| a[:status] == 'assigned' }).to be true
          end
        end

        response(200, 'filters by location') do
          before do
            create(:asset, location: 'Cebu Office')
            create(:asset, location: 'Manila HQ')
          end
          let(:location) { 'Cebu' }

          run_test! do
            results = json_response[:status][:data][:assets]
            expect(results.length).to eq 1
            expect(results.first[:location]).to eq 'Cebu Office'
          end
        end

        response(200, 'filters by purchase date range') do
          before do
            create(:asset, purchase_date: '2025-01-01')
            create(:asset, purchase_date: '2026-06-01')
          end
          let(:purchase_date_from) { '2026-01-01' }
          let(:purchase_date_to) { '2026-12-31' }

          run_test! do
            results = json_response[:status][:data][:assets]
            expect(results.length).to eq 1
          end
        end
      end
    end
  end

  describe '#export' do
    path '/api/v1/assets/export' do
      get 'exports assets as CSV' do
        tags 'Assets'
        security [ bearerAuth: [] ]
        parameter name: :q, in: :query, type: :string, required: false
        parameter name: :category, in: :query, type: :string, required: false
        parameter name: :status, in: :query, type: :string, required: false

        response(200, 'returns CSV for manager') do
          before do
            create_list(:asset, 2)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(response.content_type).to include('text/csv')
            rows = CSV.parse(response.body, headers: true)
            expect(rows.length).to eq 2
            expect(rows.headers).to include('asset_code', 'name', 'status')
          end
        end

        response(200, 'exports only filtered results') do
          before do
            create(:asset, :laptop)
            create(:asset, :monitor)
            sign_in manager
          end
          let(:category) { 'laptop' }

          run_test! do |response|
            rows = CSV.parse(response.body, headers: true)
            expect(rows.length).to eq 1
            expect(rows.first['category']).to eq 'laptop'
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
