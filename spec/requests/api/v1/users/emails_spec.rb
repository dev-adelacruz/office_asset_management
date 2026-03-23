# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Emails' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:password) { 'password123' }
  let(:user) { create(:user, email: 'current@example.com', password: password) }

  describe '#update (own email)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/email' do
      patch 'requests email change for current user' do
        tags 'Emails'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            user: {
              type: :object,
              required: [ 'current_password', 'email' ],
              properties: {
                current_password: { type: :string },
                email: { type: :string }
              }
            }
          }
        }

        response(200, 'sends confirmation email to new address') do
          let(:params) { { user: { current_password: password, email: 'new@example.com' } } }

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response[:status][:code]).to eq 200
            expect(user.reload.pending_email).to eq 'new@example.com'
            expect(user.reload.email_confirmation_token).not_to be_nil
            expect(user.reload.email).to eq 'current@example.com'
          end
        end

        response(422, 'returns error when current password is wrong') do
          let(:params) { { user: { current_password: 'wrongpassword', email: 'new@example.com' } } }

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'Current password is incorrect.'
          end
        end

        response(422, 'returns error when new email is same as current') do
          let(:params) { { user: { current_password: password, email: 'current@example.com' } } }

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'New email must differ from the current email.'
          end
        end

        response(422, 'returns error when new email is already taken') do
          let!(:other_user) { create(:user, email: 'taken@example.com') }
          let(:params) { { user: { current_password: password, email: 'taken@example.com' } } }

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'Email is already taken.'
          end
        end

        response(401, 'returns unauthorized when not signed in') do
          let(:params) { { user: { current_password: password, email: 'new@example.com' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#admin_update (manager changes another user\'s email)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/{id}/email' do
      patch 'allows manager to change employee email' do
        tags 'Emails'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            user: {
              type: :object,
              required: [ 'email' ],
              properties: {
                email: { type: :string }
              }
            }
          }
        }

        response(200, 'manager sends confirmation email to employee\'s new address') do
          let(:manager) { create(:user, :manager) }
          let(:employee) { create(:user, :employee, email: 'employee@example.com') }
          let(:id) { employee.id }
          let(:params) { { user: { email: 'employee-new@example.com' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(employee.reload.pending_email).to eq 'employee-new@example.com'
            expect(employee.reload.email).to eq 'employee@example.com'
          end
        end

        response(403, 'returns forbidden when employee tries to change another user\'s email') do
          let(:other_employee) { create(:user, :employee) }
          let(:target) { create(:user, :employee) }
          let(:id) { target.id }
          let(:params) { { user: { email: 'hacked@example.com' } } }

          before { sign_in other_employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(401, 'returns unauthorized when not signed in') do
          let(:id) { 1 }
          let(:params) { { user: { email: 'new@example.com' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#confirm (email confirmation)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/confirm_email' do
      get 'confirms email change via token' do
        tags 'Emails'
        security []
        parameter name: :token, in: :query, type: :string, required: true

        response(200, 'applies email change on valid token') do
          let(:raw_token) { SecureRandom.urlsafe_base64 }
          let!(:pending_user) do
            create(:user,
              email: 'old@example.com',
              pending_email: 'confirmed@example.com',
              email_confirmation_token: Digest::SHA256.hexdigest(raw_token),
              email_confirmation_sent_at: 1.hour.ago)
          end
          let(:token) { raw_token }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(pending_user.reload.email).to eq 'confirmed@example.com'
            expect(pending_user.reload.pending_email).to be_nil
            expect(pending_user.reload.email_confirmation_token).to be_nil
          end
        end

        response(422, 'returns error for invalid token') do
          let(:token) { 'invalid-token' }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'Invalid confirmation token.'
          end
        end

        response(422, 'returns error for expired token') do
          let(:raw_token) { SecureRandom.urlsafe_base64 }
          let!(:expired_user) do
            create(:user,
              email: 'old@example.com',
              pending_email: 'new@example.com',
              email_confirmation_token: Digest::SHA256.hexdigest(raw_token),
              email_confirmation_sent_at: 25.hours.ago)
          end
          let(:token) { raw_token }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'Confirmation token has expired. Please request a new one.'
          end
        end
      end
    end
  end
end
