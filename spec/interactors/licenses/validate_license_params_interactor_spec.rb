# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::ValidateLicenseParamsInteractor do
  subject(:result) { described_class.call(context_params) }

  let(:valid_params) { attributes_for(:license) }

  describe "with valid params and no existing license (create path)" do
    let(:context_params) { { license_params: valid_params } }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "with valid params and an existing license (update path)" do
    let!(:license) { create(:license) }
    let(:context_params) { { license: license, license_params: { software_name: "Updated Name" } } }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "with missing required fields" do
    let(:context_params) { { license_params: { software_name: "" } } }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a validation message" do
      expect(result.message).to be_present
    end
  end

  describe "with invalid seat count" do
    let(:context_params) { { license_params: valid_params.merge(total_seats: 0) } }

    it "fails the context" do
      expect(result).to be_failure
    end
  end
end
