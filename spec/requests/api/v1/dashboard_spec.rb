# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Dashboard' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }

  describe '#index' do
    path '/api/v1/dashboard' do
      get 'returns aggregated dashboard data' do
        tags 'Dashboard'
        security [ bearerAuth: [] ]
        parameter name: :period, in: :query, type: :string, required: false,
          enum: %w[this_month last_month last_quarter this_year],
          description: 'Filter metrics by time period'

        response(200, 'returns asset, license, and request counts') do
          before do
            create(:asset, status: 'available', purchase_cost: 1000)
            create(:asset, status: 'assigned', purchase_cost: 2000)
            create(:asset, status: 'available', purchase_cost: 500)
            create(:license, expiry_date: Date.today + 60, total_seats: 10)
            create(:license, expiry_date: Date.today + 15, total_seats: 5)
            create(:asset_request, status: 'pending')
            create(:asset_request, status: 'approved')
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]

            expect(data[:assets][:total]).to eq 3
            expect(data[:assets][:total_value]).to eq 3500.0
            expect(data[:assets][:by_status][:available]).to eq 2
            expect(data[:assets][:by_status][:assigned]).to eq 1

            expect(data[:licenses][:total]).to eq 2
            expect(data[:licenses][:active]).to eq 1
            expect(data[:licenses][:expiring_soon]).to eq 1
            expect(data[:licenses][:utilization][:total_seats]).to eq 15
            expect(data[:licenses][:utilization][:used_seats]).to eq 0

            expect(data[:requests][:pending]).to eq 1
            expect(data[:requests][:approved]).to eq 1
          end
        end

        response(200, 'returns license utilization with assigned seats') do
          before do
            license = create(:license, total_seats: 20)
            create(:license_seat, license: license)
            create(:license_seat, license: license)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]
            expect(data[:licenses][:utilization][:total_seats]).to eq 20
            expect(data[:licenses][:utilization][:used_seats]).to eq 2
          end
        end

        response(200, 'returns by_category breakdown') do
          before do
            create(:asset, category: 'laptop')
            create(:asset, category: 'laptop')
            create(:asset, category: 'monitor')
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]
            expect(data[:assets][:by_category][:laptop]).to eq 2
            expect(data[:assets][:by_category][:monitor]).to eq 1
            expect(data[:assets][:by_category][:peripheral]).to eq 0
          end
        end

        response(200, 'filters period_additions and period_spend by this_month') do
          let(:period) { 'this_month' }

          before do
            create(:asset, purchase_cost: 500, created_at: 2.months.ago)
            create(:asset, purchase_cost: 1200, created_at: Time.current)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]
            expect(data[:assets][:period_additions]).to eq 1
            expect(data[:assets][:period_spend]).to eq 1200.0
          end
        end

        response(200, 'executive sees recent audit log activity') do
          before do
            create(:asset)
            sign_in executive
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]
            expect(data[:recent_activity]).to be_an Array
          end
        end

        response(200, 'employee sees recent notification activity') do
          before do
            sign_in employee
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]
            expect(data[:recent_activity]).to be_an Array
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
end
