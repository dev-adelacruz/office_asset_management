# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::CreateAssetRequestUsecase do
  let!(:user) { create(:user, :employee) }
  let(:valid_params) do
    {
      asset_type: "physical",
      justification: "Need a laptop for remote work.",
      urgency: "high"
    }
  end

  subject(:result) { described_class.call(asset_request_params: params, current_user: user) }

  describe "happy path" do
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates an AssetRequest" do
      expect { result }.to change(AssetRequest, :count).by(1)
    end

    it "creates an AssetRequestStatusLog" do
      expect { result }.to change(AssetRequestStatusLog, :count).by(1)
    end

    it "returns the asset_request on context" do
      expect(result.asset_request).to be_a(AssetRequest)
    end

    it "sets the status log to_status to pending" do
      expect(result.asset_request_status_log.to_status).to eq("pending")
    end

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the asset request" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(result.asset_request)
      expect(log.actor).to eq(user)
      expect(log.action).to eq("create")
    end
  end

  describe "invalid params" do
    let(:params) { valid_params.merge(justification: nil) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — no asset request created" do
      expect { result }.not_to change(AssetRequest, :count)
    end

    it "rolls back — no status log created" do
      expect { result }.not_to change(AssetRequestStatusLog, :count)
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end

  describe "mid-chain failure (log insert fails)" do
    let(:params) { valid_params }

    before do
      allow_any_instance_of(AssetRequests::LogAssetRequestStatusInteractor).to receive(:call) do |interactor|
        interactor.context.fail!(message: "Simulated log failure")
      end
    end

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — no asset request created" do
      expect { result }.not_to change(AssetRequest, :count)
    end

    it "rolls back — no status log created" do
      expect { result }.not_to change(AssetRequestStatusLog, :count)
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
