# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::CreateAssetUsecase do
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(asset_params: asset_params, current_user: user) }

  describe "happy path" do
    let(:asset_params) { attributes_for(:asset) }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates an Asset record" do
      expect { result }.to change(Asset, :count).by(1)
    end

    it "returns the created asset on context" do
      expect(result.asset).to be_a(Asset)
      expect(result.asset).to be_persisted
    end

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the correct auditable and actor" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(result.asset)
      expect(log.actor).to eq(user)
      expect(log.action).to eq("create")
    end
  end

  describe "mid-chain failure — validation fails before persistence" do
    let(:asset_params) { attributes_for(:asset, name: "") }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — does not create any Asset record" do
      expect { result }.not_to change(Asset, :count)
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
