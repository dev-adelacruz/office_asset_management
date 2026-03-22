# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::UpdateLicenseUsecase do
  let!(:license) { create(:license) }
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(license: license, license_params: license_params, current_user: user) }

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

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the correct auditable and actor" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(license)
      expect(log.actor).to eq(user)
      expect(log.action).to eq("update")
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

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
