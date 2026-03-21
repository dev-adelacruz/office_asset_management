# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Asset Requests' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }

  let(:valid_params) do
    {
      asset_request: {
        asset_type: 'physical',
        justification: 'Need a laptop for remote work.',
        urgency: 'high',
        preferred_fulfillment_date: (Date.today + 7).to_s
      }
    }
  end

  describe '#index' do
    path '/api/v1/asset_requests' do
      get 'lists asset requests' do
        tags 'Asset Requests'
        security [ bearerAuth: [] ]

        response(200, 'manager sees all requests') do
          before do
            create_list(:asset_request, 3)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(json_response[:status][:data][:asset_requests].length).to eq 3
          end
        end

        response(200, 'employee sees only their own requests') do
          before do
            create(:asset_request, user: employee)
            create(:asset_request)
            sign_in employee
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:asset_requests].length).to eq 1
          end
        end

        response(200, 'executive sees all requests') do
          before do
            create_list(:asset_request, 2)
            sign_in executive
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:asset_requests].length).to eq 2
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
    path '/api/v1/asset_requests' do
      post 'submits an asset request' do
        tags 'Asset Requests'
        security [ bearerAuth: [] ]
        consumes 'application/json'
        parameter name: :body, in: :body, schema: { type: :object }

        response(201, 'employee submits a physical asset request') do
          let(:body) { valid_params }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :created
            expect(json_response[:status][:code]).to eq 201
            data = json_response[:status][:data][:asset_request]
            expect(data[:asset_type]).to eq 'physical'
            expect(data[:urgency]).to eq 'high'
            expect(data[:status]).to eq 'pending'
            expect(data[:user][:id]).to eq employee.id
          end
        end

        response(201, 'employee submits a software license request') do
          let(:body) do
            {
              asset_request: {
                asset_type: 'software',
                justification: 'Need Adobe CC for design work.',
                urgency: 'medium',
                preferred_fulfillment_date: (Date.today + 14).to_s
              }
            }
          end
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :created
            expect(json_response[:status][:data][:asset_request][:asset_type]).to eq 'software'
          end
        end

        response(201, 'manager can also submit a request') do
          let(:body) { valid_params }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :created
          end
        end

        response(422, 'missing required fields') do
          let(:body) { { asset_request: { urgency: 'low' } } }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(422, 'invalid asset_type') do
          let(:body) do
            valid_params.deep_merge(asset_request: { asset_type: 'vehicle' })
          end
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
          end
        end

        response(401, 'unauthenticated') do
          let(:body) { valid_params }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
