# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::RejectAssetRequestUsecase do
  let!(:manager) { create(:user, :manager) }
  let!(:employee) { create(:user, :employee) }
  let!(:asset_request) { create(:asset_request, user: employee) }
  let(:valid_note) { "Insufficient budget." }

  subject(:result) { described_class.call(asset_request: asset_request, current_user: user, rejection_note: note) }

  describe "happy path" do
    let(:user) { manager }
    let(:note) { valid_note }

    it "succeeds" do
      expect(result).to be_success
    end

    it "sets the asset_request status to rejected" do
      result
      expect(asset_request.reload.status).to eq("rejected")
    end

    it "saves the rejection note" do
      result
      expect(asset_request.reload.notes).to eq(valid_note)
    end

    it "creates an AssetRequestStatusLog" do
      expect { result }.to change(AssetRequestStatusLog, :count).by(1)
    end

    it "returns the updated asset_request on context" do
      expect(result.asset_request.status).to eq("rejected")
    end

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the asset request" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(asset_request)
      expect(log.actor).to eq(manager)
      expect(log.action).to eq("update")
    end
  end

  describe "missing rejection note" do
    let(:user) { manager }
    let(:note) { nil }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a relevant message" do
      expect(result.message).to include("Notes is required")
    end

    it "rolls back — no status log created" do
      expect { result }.not_to change(AssetRequestStatusLog, :count)
    end

    it "does not change the asset_request status" do
      expect { result }.not_to change { asset_request.reload.status }
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end

  describe "unauthorized user" do
    let(:user) { employee }
    let(:note) { valid_note }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — no status log created" do
      expect { result }.not_to change(AssetRequestStatusLog, :count)
    end

    it "does not change the asset_request status" do
      expect { result }.not_to change { asset_request.reload.status }
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end

  describe "mid-chain failure (log insert fails)" do
    let(:user) { manager }
    let(:note) { valid_note }

    before do
      allow_any_instance_of(AssetRequests::LogAssetRequestStatusInteractor).to receive(:call) do |interactor|
        interactor.context.fail!(message: "Simulated log failure")
      end
    end

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — no status change persisted" do
      expect { result }.not_to change { asset_request.reload.status }
    end

    it "rolls back — no status log created" do
      expect { result }.not_to change(AssetRequestStatusLog, :count)
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
