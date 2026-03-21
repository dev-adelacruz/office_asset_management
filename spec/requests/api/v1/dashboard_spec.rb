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

        response(200, 'returns asset, license, and request counts') do
          before do
            create(:asset, status: 'available')
            create(:asset, status: 'assigned')
            create(:asset, status: 'available')
            create(:license, expiry_date: Date.today + 60)
            create(:license, expiry_date: Date.today + 15)
            create(:asset_request, status: 'pending')
            create(:asset_request, status: 'approved')
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            data = json_response[:status][:data]

            expect(data[:assets][:total]).to eq 3
            expect(data[:assets][:by_status][:available]).to eq 2
            expect(data[:assets][:by_status][:assigned]).to eq 1

            expect(data[:licenses][:total]).to eq 2
            expect(data[:licenses][:active]).to eq 1
            expect(data[:licenses][:expiring_soon]).to eq 1

            expect(data[:requests][:pending]).to eq 1
            expect(data[:requests][:approved]).to eq 1
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
