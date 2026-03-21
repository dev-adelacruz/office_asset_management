# frozen_string_literal: true

require 'swagger_helper'

RSpec.describe 'Profiles' do
  let(:json_response) { JSON.parse(response.body, symbolize_names: true) }
  let(:user) { create(:user) }

  describe '#update (own profile)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/profile' do
      patch 'updates current user profile' do
        tags 'Profiles'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            user: {
              type: :object,
              properties: {
                name: { type: :string },
                phone_number: { type: :string },
                office_location: { type: :string },
                avatar_url: { type: :string }
              }
            }
          }
        }

        response(200, 'updates profile successfully') do
          let(:params) do
            {
              user: {
                name: 'Jane Doe',
                phone_number: '+1234567890',
                office_location: 'Manila HQ'
              }
            }
          end

          before do
            sign_in user
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response).to include(
              status: include(
                code: 200,
                message: 'Profile updated successfully.',
                data: include(
                  user: include(
                    name: 'Jane Doe',
                    phone_number: '+1234567890',
                    office_location: 'Manila HQ'
                  )
                )
              )
            )
          end
        end

        response(401, 'returns unauthorized when not signed in') do
          let(:params) { { user: { name: 'Jane Doe' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end

  describe '#update (manager edits employee profile)' do # rubocop:disable RSpec/EmptyExampleGroup
    path '/api/v1/users/{id}/profile' do
      patch 'allows manager to update employee profile' do
        tags 'Profiles'
        consumes 'application/json'
        security [ bearerAuth: [] ]
        parameter name: :id, in: :path, type: :integer, required: true
        parameter name: :params, in: :body, schema: {
          type: :object,
          properties: {
            user: {
              type: :object,
              properties: {
                name: { type: :string },
                phone_number: { type: :string },
                office_location: { type: :string },
                avatar_url: { type: :string }
              }
            }
          }
        }

        response(200, 'manager updates employee profile successfully') do
          let(:manager) { create(:user, :manager) }
          let(:employee) { create(:user, :employee) }
          let(:id) { employee.id }
          let(:params) { { user: { name: 'Updated Name', office_location: 'Cebu Office' } } }

          before do
            sign_in manager
          end

          run_test! do |response|
            expect(response).to have_http_status :ok
            expect(json_response).to include(
              status: include(
                code: 200,
                message: 'Profile updated successfully.',
                data: include(
                  user: include(name: 'Updated Name', office_location: 'Cebu Office')
                )
              )
            )
          end
        end

        response(403, 'returns forbidden when employee tries to edit another user') do
          let(:other_employee) { create(:user, :employee) }
          let(:target) { create(:user, :employee) }
          let(:id) { target.id }
          let(:params) { { user: { name: 'Hacked Name' } } }

          before do
            sign_in other_employee
          end

          run_test! do |response|
            expect(response).to have_http_status :forbidden
          end
        end

        response(401, 'returns unauthorized when not signed in') do
          let(:id) { 1 }
          let(:params) { { user: { name: 'Jane Doe' } } }

          run_test! do |response|
            expect(response).to have_http_status :unauthorized
          end
        end
      end
    end
  end
end
