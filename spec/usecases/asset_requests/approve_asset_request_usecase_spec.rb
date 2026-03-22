# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::ApproveAssetRequestUsecase do
  let!(:manager) { create(:user, :manager) }
  let!(:employee) { create(:user, :employee) }
  let!(:asset_request) { create(:asset_request, user: employee) }

  subject(:result) { described_class.call(asset_request: asset_request, current_user: user) }

  describe "happy path" do
    let(:user) { manager }

    it "succeeds" do
      expect(result).to be_success
    end

    it "sets the asset_request status to approved" do
      result
      expect(asset_request.reload.status).to eq("approved")
    end

    it "creates an AssetRequestStatusLog" do
      expect { result }.to change(AssetRequestStatusLog, :count).by(1)
    end

    it "returns the updated asset_request on context" do
      expect(result.asset_request.status).to eq("approved")
    end
  end

  describe "unauthorized user" do
    let(:user) { employee }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — no status log created" do
      expect { result }.not_to change(AssetRequestStatusLog, :count)
    end

    it "does not change the asset_request status" do
      expect { result }.not_to change { asset_request.reload.status }
    end
  end

  describe "mid-chain failure (log insert fails)" do
    let(:user) { manager }

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
  end
end
