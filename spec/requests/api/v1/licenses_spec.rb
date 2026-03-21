# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Licenses' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }

  let(:valid_params) do
    {
      license: {
        software_name: 'Adobe Creative Cloud',
        vendor: 'Adobe Inc.',
        license_key: 'XXXX-YYYY-ZZZZ-1234-ABCD-5678',
        total_seats: 10,
        cost: 599.99,
        expiry_date: (Date.today + 365).to_s,
        renewal_contact: 'it@company.com',
        purchase_order_number: 'PO-2026-001'
      }
    }
  end

  describe '#index' do
    path '/api/v1/licenses' do
      get 'lists all licenses' do
        tags 'Licenses'
        security [ bearerAuth: [] ]

        parameter name: :page, in: :query, type: :integer, required: false
        parameter name: :per_page, in: :query, type: :integer, required: false
        parameter name: :q, in: :query, type: :string, required: false
        parameter name: :status, in: :query, type: :string, required: false

        response(200, 'returns all licenses with pagination metadata') do
          before do
            create_list(:license, 3)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:licenses].length).to eq 3
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:total_count]).to eq 3
            expect(pagination[:current_page]).to eq 1
            expect(pagination[:per_page]).to eq 25
          end
        end

        response(200, 'employee can view licenses') do
          before do
            create_list(:license, 2)
            sign_in employee
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:licenses].length).to eq 2
            expect(json_response[:status][:data][:pagination][:total_count]).to eq 2
          end
        end

        response(200, 'paginates results') do
          let(:page) { 2 }
          let(:per_page) { 2 }

          before do
            create_list(:license, 5)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:licenses].length).to eq 2
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:current_page]).to eq 2
            expect(pagination[:total_count]).to eq 5
            expect(pagination[:total_pages]).to eq 3
          end
        end

        response(200, 'filters by search query') do
          let(:q) { 'Adobe' }

          before do
            create(:license, software_name: 'Adobe Creative Cloud')
            create(:license, software_name: 'Slack Pro')
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:licenses].length).to eq 1
            expect(json_response[:status][:data][:licenses][0][:software_name]).to eq 'Adobe Creative Cloud'
            expect(json_response[:status][:data][:pagination][:total_count]).to eq 1
          end
        end

        response(200, 'filters by status') do
          let(:status) { 'expired' }

          before do
            create(:license, expiry_date: Date.today - 10)
            create(:license, expiry_date: Date.today + 60)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:licenses].length).to eq 1
            expect(json_response[:status][:data][:pagination][:total_count]).to eq 1
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

  describe '#create' do
    path '/api/v1/licenses' do
      post 'registers a new license' do
        tags 'Licenses'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            license: {
              type: :object,
              required: %w[software_name vendor license_key total_seats cost expiry_date],
              properties: {
                software_name: { type: :string },
                vendor: { type: :string },
                license_key: { type: :string },
                total_seats: { type: :integer },
                cost: { type: :number },
                expiry_date: { type: :string, format: :date },
                renewal_contact: { type: :string },
                purchase_order_number: { type: :string },
                notes: { type: :string }
              }
            }
          }
        }

        response(201, 'manager creates license successfully') do
          let(:params) { valid_params }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :created
            expect(json_response[:status][:code]).to eq 201
            expect(json_response[:status][:data][:license]).to include(
              software_name: 'Adobe Creative Cloud',
              vendor: 'Adobe Inc.',
              total_seats: 10
            )
            expect(json_response[:status][:data][:license][:status]).to eq 'active'
          end
        end

        response(201, 'executive creates license successfully') do
          let(:params) { valid_params.deep_merge(license: { software_name: 'Slack Pro', license_key: 'ALT-KEY-9999' }) }

          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :created
          end
        end

        response(403, 'employee cannot create license') do
          let(:params) { valid_params }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
            expect(json_response[:message]).to eq 'Forbidden. Insufficient permissions.'
          end
        end

        response(422, 'missing required fields') do
          let(:params) { { license: { software_name: '' } } }

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

  describe '#update' do
    let(:license) { create(:license) }

    path '/api/v1/licenses/{id}' do
      patch 'updates a license' do
        tags 'Licenses'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            license: {
              type: :object,
              properties: {
                software_name: { type: :string },
                vendor: { type: :string },
                license_key: { type: :string },
                total_seats: { type: :integer },
                cost: { type: :number },
                expiry_date: { type: :string, format: :date },
                renewal_contact: { type: :string },
                purchase_order_number: { type: :string },
                notes: { type: :string }
              }
            }
          }
        }

        response(200, 'manager updates license successfully') do
          let(:id) { license.id }
          let(:params) { { license: { total_seats: 25, renewal_contact: 'updated@company.com' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:license]).to include(
              total_seats: 25,
              renewal_contact: 'updated@company.com'
            )
          end
        end

        response(200, 'executive updates license successfully') do
          let(:id) { license.id }
          let(:params) { { license: { notes: 'Renewal pending approval' } } }

          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :ok
          end
        end

        response(403, 'employee cannot update license') do
          let(:id) { license.id }
          let(:params) { { license: { notes: 'Sneaky edit' } } }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'license not found') do
          let(:id) { 0 }
          let(:params) { { license: { notes: 'Ghost' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(422, 'invalid update params') do
          let(:id) { license.id }
          let(:params) { { license: { software_name: '' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(401, 'unauthenticated') do
          let(:id) { license.id }
          let(:params) { { license: { notes: 'No auth' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
