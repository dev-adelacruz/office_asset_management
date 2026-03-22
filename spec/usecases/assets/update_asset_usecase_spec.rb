# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::UpdateAssetUsecase do
  let!(:asset) { create(:asset) }
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(asset: asset, asset_params: asset_params, current_user: user) }

  describe "happy path" do
    let(:asset_params) { { name: "Updated Asset Name", location: "Cebu Office" } }

    it "succeeds" do
      expect(result).to be_success
    end

    it "does not create a new record" do
      expect { result }.not_to change(Asset, :count)
    end

    it "updates the asset attributes" do
      expect(result.asset.name).to eq("Updated Asset Name")
      expect(result.asset.location).to eq("Cebu Office")
    end

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the correct auditable and actor" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(asset)
      expect(log.actor).to eq(user)
      expect(log.action).to eq("update")
    end
  end

  describe "mid-chain failure — validation fails before persistence" do
    let(:asset_params) { { name: "" } }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — asset name is not changed in the DB" do
      original_name = asset.name
      result
      expect(asset.reload.name).to eq(original_name)
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
