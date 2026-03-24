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

        parameter name: :page, in: :query, type: :integer, required: false
        parameter name: :per_page, in: :query, type: :integer, required: false

        response(200, 'manager sees all requests sorted by urgency with pagination metadata') do
          before do
            create(:asset_request, urgency: 'low')
            create(:asset_request, urgency: 'high')
            create(:asset_request, urgency: 'medium')
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            urgencies = json_response[:status][:data][:asset_requests].map { |r| r[:urgency] }
            expect(urgencies).to eq %w[high medium low]
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:total_count]).to eq 3
            expect(pagination[:current_page]).to eq 1
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
            expect(json_response[:status][:data][:pagination][:total_count]).to eq 1
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
            expect(json_response[:status][:data][:pagination][:total_count]).to eq 2
          end
        end

        response(200, 'paginates results for manager') do
          let(:page) { 2 }
          let(:per_page) { 2 }

          before do
            create_list(:asset_request, 5)
            sign_in manager
          end

          run_test! do |response|
            expect(json_response[:status][:data][:asset_requests].length).to eq 2
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:current_page]).to eq 2
            expect(pagination[:total_count]).to eq 5
            expect(pagination[:total_pages]).to eq 3
          end
        end

        response(200, 'employee pagination only counts their own requests') do
          let(:page) { 1 }
          let(:per_page) { 2 }

          before do
            create_list(:asset_request, 3, user: employee)
            create_list(:asset_request, 2)
            sign_in employee
          end

          run_test! do |response|
            expect(json_response[:status][:data][:asset_requests].length).to eq 2
            pagination = json_response[:status][:data][:pagination]
            expect(pagination[:total_count]).to eq 3
            expect(pagination[:total_pages]).to eq 2
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
            expect(AssetRequestStatusLog.where(to_status: 'pending').count).to eq 1
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

        response(201, 'employee submits a request linked to a specific asset') do
          let(:asset) { create(:asset, :laptop) }
          let(:body) do
            {
              asset_request: {
                asset_type: 'physical',
                justification: 'Need this specific laptop for remote work.',
                urgency: 'high',
                asset_id: asset.id
              }
            }
          end
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :created
            data = json_response[:status][:data][:asset_request]
            expect(data[:asset_id]).to eq asset.id
            expect(data[:asset][:id]).to eq asset.id
            expect(data[:asset][:name]).to eq asset.name
            expect(data[:license_id]).to be_nil
          end
        end

        response(201, 'employee submits a request linked to a specific license') do
          let(:license) { create(:license) }
          let(:body) do
            {
              asset_request: {
                asset_type: 'software',
                justification: 'Need access for design projects.',
                urgency: 'medium',
                license_id: license.id
              }
            }
          end
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :created
            data = json_response[:status][:data][:asset_request]
            expect(data[:license_id]).to eq license.id
            expect(data[:license][:id]).to eq license.id
            expect(data[:license][:software_name]).to eq license.software_name
            expect(data[:asset_id]).to be_nil
          end
        end

        response(422, 'cannot reference both asset and license') do
          let(:asset) { create(:asset) }
          let(:license) { create(:license) }
          let(:body) do
            {
              asset_request: {
                asset_type: 'physical',
                justification: 'Dual reference test.',
                urgency: 'low',
                asset_id: asset.id,
                license_id: license.id
              }
            }
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

  describe '#show' do
    let(:request_with_logs) { create(:asset_request, user: employee) }

    before do
      request_with_logs.asset_request_status_logs.create!(
        changed_by: employee,
        from_status: nil,
        to_status: 'pending'
      )
    end

    path '/api/v1/asset_requests/{id}' do
      get 'returns a single asset request with timeline' do
        tags 'Asset Requests'
        security [ bearerAuth: [] ]
        parameter name: :id, in: :path, type: :integer

        response(200, 'employee views their own request timeline') do
          let(:id) { request_with_logs.id }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data][:asset_request]
            expect(data[:id]).to eq request_with_logs.id
            expect(data[:status_logs]).to be_an Array
            expect(data[:status_logs].length).to eq 1
            expect(data[:status_logs][0][:to_status]).to eq 'pending'
            expect(data[:status_logs][0][:from_status]).to be_nil
            expect(data[:status_logs][0][:changed_by][:id]).to eq employee.id
          end
        end

        response(200, 'manager views any request timeline') do
          let(:id) { request_with_logs.id }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:asset_request][:status_logs]).to be_an Array
          end
        end

        response(404, 'request not found') do
          let(:id) { 0 }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:id) { request_with_logs.id }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#update' do
    let(:pending_request) { create(:asset_request, user: employee) }

    path '/api/v1/asset_requests/{id}' do
      patch 'approves or rejects an asset request' do
        tags 'Asset Requests'
        security [ bearerAuth: [] ]
        consumes 'application/json'
        parameter name: :id, in: :path, type: :integer
        parameter name: :body, in: :body, schema: { type: :object }

        response(200, 'manager approves a request') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data][:asset_request]
            expect(data[:status]).to eq 'approved'
          end
        end

        response(200, 'approving a physical request updates asset status and creates assignment log') do
          let(:asset) { create(:asset, status: :available) }
          let(:request_with_asset) { create(:asset_request, user: employee, asset: asset) }
          let(:id) { request_with_asset.id }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(asset.reload.status).to eq 'assigned'
            log = asset.asset_assignment_logs.last
            expect(log).to be_present
            expect(log.assigned_to).to eq employee
            expect(log.assigned_by).to eq manager
            expect(log.returned_at).to be_nil
          end
        end

        response(200, 'rejecting a request does not change the asset status') do
          let(:asset) { create(:asset, status: :available) }
          let(:request_with_asset) { create(:asset_request, user: employee, asset: asset) }
          let(:id) { request_with_asset.id }
          let(:body) { { asset_request: { status: 'rejected', notes: 'Budget freeze.' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(asset.reload.status).to eq 'available'
            expect(asset.asset_assignment_logs).to be_empty
          end
        end

        response(200, 'approving a request without a linked asset creates no assignment log') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(AssetAssignmentLog.count).to eq 0
          end
        end

        response(200, 'approving a license request creates a LicenseSeat and increments seats_used') do
          let(:license) { create(:license, total_seats: 5) }
          let(:license_request) { create(:asset_request, user: employee, license: license, asset_type: 'software') }
          let(:id) { license_request.id }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(LicenseSeat.where(license: license, user: employee).count).to eq 1
            expect(license.reload.seats_used).to eq 1
          end
        end

        response(200, 'rejecting a license request does not create a LicenseSeat') do
          let(:license) { create(:license, total_seats: 5) }
          let(:license_request) { create(:asset_request, user: employee, license: license, asset_type: 'software') }
          let(:id) { license_request.id }
          let(:body) { { asset_request: { status: 'rejected', notes: 'Budget freeze.' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(LicenseSeat.count).to eq 0
          end
        end

        response(200, 'manager rejects a request with notes') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'rejected', notes: 'Budget not available this quarter.' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data][:asset_request]
            expect(data[:status]).to eq 'rejected'
            expect(data[:notes]).to eq 'Budget not available this quarter.'
          end
        end

        response(200, 'executive can approve a request') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:asset_request][:status]).to eq 'approved'
          end
        end

        response(422, 'rejection without notes is rejected') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'rejected' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to include 'Notes is required'
          end
        end

        response(403, 'employee cannot approve or reject') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'request not found') do
          let(:id) { 0 }
          let(:body) { { asset_request: { status: 'approved' } } }
          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:id) { pending_request.id }
          let(:body) { { asset_request: { status: 'approved' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
