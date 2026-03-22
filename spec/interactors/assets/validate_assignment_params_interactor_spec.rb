# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::ValidateAssignmentParamsInteractor do
  let!(:asset) { create(:asset) }
  let(:employee) { create(:user, :employee) }

  let(:manager) { create(:user, :manager) }

  subject(:result) { described_class.call(asset: asset, assignment_params: params, current_user: manager) }

  describe "with valid params" do
    let(:params) { { assigned_to_id: employee.id, assigned_at: Time.current } }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "with missing required fields" do
    let(:params) { { assigned_to_id: employee.id } }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a validation message" do
      expect(result.message).to be_present
    end
  end

  describe "with empty params" do
    let(:params) { {} }

    it "fails the context" do
      expect(result).to be_failure
    end
  end
end
