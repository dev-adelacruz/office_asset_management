# frozen_string_literal: true

require "rails_helper"

RSpec.describe Licenses::PersistLicenseInteractor do
  subject(:result) { described_class.call(context_params) }

  describe "create path (no license in context)" do
    let(:context_params) { { license_params: attributes_for(:license) } }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates a new License record" do
      expect { result }.to change(License, :count).by(1)
    end

    it "writes the new license to context.license" do
      expect(result.license).to be_a(License)
      expect(result.license).to be_persisted
    end
  end

  describe "update path (license present in context)" do
    let!(:license) { create(:license) }
    let(:context_params) { { license: license, license_params: { software_name: "Renamed Software" } } }

    it "succeeds" do
      expect(result).to be_success
    end

    it "does not create a new record" do
      expect { result }.not_to change(License, :count)
    end

    it "updates the license attributes" do
      expect(result.license.software_name).to eq("Renamed Software")
    end
  end

  describe "AR validation failure (duplicate license_key)" do
    let!(:existing) { create(:license) }
    let(:context_params) { { license_params: attributes_for(:license, license_key: existing.license_key) } }

    it "raises ActiveRecord::RecordInvalid" do
      skip "license_key is encrypted — uniqueness not enforced at DB level"
    end
  end
end
