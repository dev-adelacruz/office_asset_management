# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::CreateLicenseUsecase do
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(license_params: license_params, current_user: user) }

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

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the correct auditable and actor" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(result.license)
      expect(log.actor).to eq(user)
      expect(log.action).to eq("create")
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

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
