# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Passwords' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:password) { 'password123' }
  let(:user) { create(:user, password: password) }

  describe '#update (own password)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/password' do
      patch 'changes own password' do
        tags 'Passwords'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            user: {
              type: :object,
              required: [ 'current_password', 'password', 'password_confirmation' ],
              properties: {
                current_password: { type: :string },
                password: { type: :string },
                password_confirmation: { type: :string }
              }
            }
          }
        }

        response(200, 'updates password successfully') do
          let(:params) do
            {
              user: {
                current_password: password,
                password: 'newpassword123',
                password_confirmation: 'newpassword123'
              }
            }
          end

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response).to include(
              status: include(
                code: 200,
                message: 'Password updated successfully. Please sign in again.'
              )
            )
            expect(user.reload.valid_password?('newpassword123')).to be true
          end
        end

        response(422, 'returns error when current password is wrong') do
          let(:params) do
            {
              user: {
                current_password: 'wrongpassword',
                password: 'newpassword123',
                password_confirmation: 'newpassword123'
              }
            }
          end

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'Current password is incorrect.'
          end
        end

        response(422, 'returns error when new password matches current') do
          let(:params) do
            {
              user: {
                current_password: password,
                password: password,
                password_confirmation: password
              }
            }
          end

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'New password must differ from the current password.'
          end
        end

        response(422, 'returns error when confirmation does not match') do
          let(:params) do
            {
              user: {
                current_password: password,
                password: 'newpassword123',
                password_confirmation: 'mismatch456'
              }
            }
          end

          before { sign_in user }

          run_test! do |response|
            expect(response).to have_http_status :unprocessable_entity
            expect(json_response[:message]).to eq 'Password confirmation does not match.'
          end
        end

        response(401, 'returns unauthorized when not signed in') do
          let(:params) { { user: { current_password: password, password: 'new', password_confirmation: 'new' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#admin_update (manager changes another user\'s password)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/{id}/password' do
      patch 'allows manager to change employee password' do
        tags 'Passwords'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            user: {
              type: :object,
              required: [ 'password', 'password_confirmation' ],
              properties: {
                password: { type: :string },
                password_confirmation: { type: :string }
              }
            }
          }
        }

        response(200, 'manager updates employee password successfully') do
          let(:manager) { create(:user, :manager) }
          let(:employee) { create(:user, :employee) }
          let(:id) { employee.id }
          let(:params) { { user: { password: 'newpassword123', password_confirmation: 'newpassword123' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response).to include(
              status: include(code: 200, message: 'Password updated successfully.')
            )
            expect(employee.reload.valid_password?('newpassword123')).to be true
          end
        end

        response(403, 'returns forbidden when employee tries to change another user\'s password') do
          let(:other_employee) { create(:user, :employee) }
          let(:target) { create(:user, :employee) }
          let(:id) { target.id }
          let(:params) { { user: { password: 'hacked123', password_confirmation: 'hacked123' } } }

          before { sign_in other_employee }

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(404, 'returns not found when user does not exist') do
          let(:manager) { create(:user, :manager) }
          let(:id) { 0 }
          let(:params) { { user: { password: 'newpassword123', password_confirmation: 'newpassword123' } } }

          before { sign_in manager }

          run_test! do |response|
            expect(response).to have_http_status :not_found
          end
        end

        response(401, 'returns unauthorized when not signed in') do
          let(:id) { 1 }
          let(:params) { { user: { password: 'newpassword123', password_confirmation: 'newpassword123' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
