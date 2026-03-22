# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::CreateLicenseUsecase do
  subject(:result) { described_class.call(license_params: license_params) }

  describe "happy path" do
    let(:license_params) { attributes_for(:license) }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates a License record" do
      expect { result }.to change(License, :count).by(1)
    end

    it "returns the created license on context" do
      expect(result.license).to be_a(License)
      expect(result.license).to be_persisted
    end
  end

  describe "mid-chain failure — validation fails before persistence" do
    let(:license_params) { attributes_for(:license, software_name: "") }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — does not create any License record" do
      expect { result }.not_to change(License, :count)
    end
  end
end
