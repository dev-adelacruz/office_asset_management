# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'License Seats' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:manager) { create(:user, :manager) }
  let(:executive) { create(:user, :executive) }
  let(:employee) { create(:user, :employee) }
  let(:license) { create(:license, total_seats: 3) }

  describe '#index' do
    path '/api/v1/licenses/{license_id}/seats' do
      get 'lists seats for a license' do
        tags 'License Seats'
        security [ bearerAuth: [] ]
        parameter name: :license_id, in: :path, type: :integer, required: true

        response(200, 'returns seat assignments') do
          before do
            create(:license_seat, license: license)
            sign_in manager
          end
          let(:license_id) { license.id }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:seats].length).to eq 1
          end
        end

        response(200, 'employee can view seats') do
          before { sign_in employee }
          let(:license_id) { license.id }

          run_test! do |response|
            expect(response).to have_http_status :ok
          end
        end

        response(404, 'license not found') do
          before { sign_in manager }
          let(:license_id) { 0 }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:license_id) { license.id }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#create' do
    path '/api/v1/licenses/{license_id}/seats' do
      post 'assigns a seat to a user' do
        tags 'License Seats'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :license_id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          required: %w[user_email],
          properties: {
            user_email: { type: :string }
          }
        }

        response(201, 'manager assigns seat successfully') do
          let(:license_id) { license.id }
          let(:params) { { user_email: employee.email } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :created
            expect(json_response[:status][:data][:seat][:user][:email]).to eq employee.email
            expect(json_response[:status][:data][:license][:seats_used]).to eq 1
            expect(json_response[:status][:data][:license][:seats_available]).to eq 2
          end
        end

        response(201, 'executive assigns seat successfully') do
          let(:license_id) { license.id }
          let(:params) { { user_email: employee.email } }

          before { sign_in executive }

          run_test! do |response|
            expect(response).to have_http_status :created
          end
        end

        response(422, 'prevents over-assignment beyond total_seats') do
          let(:full_license) { create(:license, total_seats: 1) }
          let(:license_id) { full_license.id }
          let(:existing_user) { create(:user, :employee) }
          let(:second_user) { create(:user, :employee) }
          let(:params) { { user_email: second_user.email } }

          before do
            create(:license_seat, license: full_license, user: existing_user)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to include('No seats available')
          end
        end

        response(422, 'prevents assigning same user twice') do
          let(:license_id) { license.id }
          let(:params) { { user_email: employee.email } }

          before do
            create(:license_seat, license: license, user: employee)
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to include('already assigned')
          end
        end

        response(403, 'employee cannot assign seats') do
          let(:license_id) { license.id }
          let(:params) { { user_email: employee.email } }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'user not found') do
          let(:license_id) { license.id }
          let(:params) { { user_email: 'ghost@example.com' } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(404, 'license not found') do
          let(:license_id) { 0 }
          let(:params) { { user_email: employee.email } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:license_id) { license.id }
          let(:params) { { user_email: employee.email } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#destroy' do
    path '/api/v1/licenses/{license_id}/seats/{id}' do
      delete 'releases a seat' do
        tags 'License Seats'
        security [ bearerAuth: [] ]
        parameter name: :license_id, in: :path, type: :integer, required: true
        parameter name: :id, in: :path, type: :integer, required: true

        response(200, 'manager releases seat successfully') do
          let(:seat) { create(:license_seat, license: license, user: employee) }
          let(:license_id) { license.id }
          let(:id) { seat.id }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:data][:license][:seats_used]).to eq 0
            expect(json_response[:status][:data][:license][:seats_available]).to eq 3
          end
        end

        response(403, 'employee cannot release seats') do
          let(:seat) { create(:license_seat, license: license, user: employee) }
          let(:license_id) { license.id }
          let(:id) { seat.id }

          before { sign_in employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'seat not found') do
          let(:license_id) { license.id }
          let(:id) { 0 }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'unauthenticated') do
          let(:seat) { create(:license_seat, license: license, user: employee) }
          let(:license_id) { license.id }
          let(:id) { seat.id }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
