# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::CreateAssignmentLogUsecase do
  let!(:asset) { create(:asset, status: :available) }
  let(:manager) { create(:user, :manager) }
  let(:employee) { create(:user, :employee) }
  let(:valid_params) { { assigned_to_id: employee.id, assigned_at: Time.current } }

  subject(:result) do
    described_class.call(asset: asset, assignment_params: params, current_user: manager)
  end

  describe "happy path" do
    let(:params) { valid_params }

    it "succeeds" do
      expect(result).to be_success
    end

    it "creates an AssetAssignmentLog" do
      expect { result }.to change(AssetAssignmentLog, :count).by(1)
    end

    it "updates asset status to assigned" do
      result
      expect(asset.reload.status).to eq("assigned")
    end

    it "returns the log on context" do
      expect(result.assignment_log).to be_a(AssetAssignmentLog)
      expect(result.assignment_log).to be_persisted
    end

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the assignment log" do
      result
      log = AuditLog.last
      expect(log.auditable).to eq(result.assignment_log)
      expect(log.actor).to eq(manager)
      expect(log.action).to eq("create")
    end
  end

  describe "mid-chain failure — invalid params fail before any DB write" do
    let(:params) { { assigned_to_id: employee.id } }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "rolls back — no assignment log created" do
      expect { result }.not_to change(AssetAssignmentLog, :count)
    end

    it "rolls back — asset status unchanged" do
      result
      expect(asset.reload.status).to eq("available")
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
