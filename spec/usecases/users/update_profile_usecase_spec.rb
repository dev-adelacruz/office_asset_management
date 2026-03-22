# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::UpdateProfileUsecase do
  let!(:employee) { create(:user, :employee) }
  let!(:other_employee) { create(:user, :employee) }
  let!(:manager) { create(:user, :manager) }
  let(:valid_params) { { name: "New Name", phone_number: "+639991234567" } }

  subject(:result) do
    described_class.call(current_user: current_user, target_user: target_user, profile_params: params)
  end

  describe "employee updating own profile" do
    let(:current_user) { employee }
    let(:target_user) { employee }
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end

    it "updates the profile" do
      result
      expect(employee.reload.name).to eq("New Name")
    end

    it "returns the updated target_user on context" do
      expect(result.target_user).to eq(employee)
    end
  end

  describe "manager updating another user's profile" do
    let(:current_user) { manager }
    let(:target_user) { employee }
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end

    it "updates the employee's profile" do
      result
      expect(employee.reload.name).to eq("New Name")
    end
  end

  describe "employee updating another user's profile" do
    let(:current_user) { employee }
    let(:target_user) { other_employee }
    let(:params) { valid_params }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "sets http_status to :forbidden" do
      expect(result.http_status).to eq(:forbidden)
    end

    it "does not update the other user's profile" do
      expect { result }.not_to change { other_employee.reload.name }
    end
  end
end
