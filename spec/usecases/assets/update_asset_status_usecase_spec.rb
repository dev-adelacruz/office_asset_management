# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::UpdateAssetStatusUsecase do
  let!(:asset) { create(:asset, status: :available) }
  let(:user) { create(:user, :manager) }

  subject(:result) do
    described_class.call(asset: asset, status: status, current_user: user)
  end

  describe "happy path" do
    let(:status) { "assigned" }

    it "succeeds" do
      expect(result).to be_success
    end

    it "updates the asset status" do
      result
      expect(asset.reload.status).to eq("assigned")
    end

    it "creates an AssetStatusLog" do
      expect { result }.to change(AssetStatusLog, :count).by(1)
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

  describe "mid-chain failure — invalid status fails before any DB write" do
    let(:status) { "broken" }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — asset status is unchanged" do
      result
      expect(asset.reload.status).to eq("available")
    end

    it "rolls back — no AssetStatusLog created" do
      expect { result }.not_to change(AssetStatusLog, :count)
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
