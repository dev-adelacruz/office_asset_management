# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::UpdateLicenseUsecase do
  let!(:license) { create(:license) }

  subject(:result) { described_class.call(license: license, license_params: license_params) }

  describe "happy path" do
    let(:license_params) { { software_name: "Updated Software", vendor: "New Vendor" } }

    it "succeeds" do
      expect(result).to be_success
    end

    it "does not create a new record" do
      expect { result }.not_to change(License, :count)
    end

    it "updates the license attributes" do
      expect(result.license.software_name).to eq("Updated Software")
      expect(result.license.vendor).to eq("New Vendor")
    end
  end

  describe "mid-chain failure — validation fails before persistence" do
    let(:license_params) { { software_name: "" } }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — license name is not changed in the DB" do
      original_name = license.software_name
      result
      expect(license.reload.software_name).to eq(original_name)
    end
  end
end
