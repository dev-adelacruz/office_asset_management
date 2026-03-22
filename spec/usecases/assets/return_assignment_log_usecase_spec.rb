# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::ReturnAssignmentLogUsecase do
  let!(:asset) { create(:asset, status: :assigned) }
  let!(:user) { create(:user, :employee) }

  subject(:result) { described_class.call(asset: asset, assignment_log: log, current_user: user) }

  describe "happy path — only open assignment returned" do
    let!(:log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }

    it "succeeds" do
      expect(result).to be_success
    end

    it "marks the log as returned" do
      result
      expect(log.reload.returned_at).not_to be_nil
    end

    it "updates asset status to available" do
      result
      expect(asset.reload.status).to eq("available")
    end

    it "creates an AuditLog record" do
      expect { result }.to change(AuditLog, :count).by(1)
    end

    it "associates the AuditLog with the assignment log" do
      result
      audit = AuditLog.last
      expect(audit.auditable).to eq(log)
      expect(audit.actor).to eq(user)
      expect(audit.action).to eq("update")
    end
  end

  describe "partial return — other open assignments remain" do
    let!(:log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }
    let!(:other_open_log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }

    it "succeeds" do
      expect(result).to be_success
    end

    it "marks the log as returned" do
      result
      expect(log.reload.returned_at).not_to be_nil
    end

    it "does not change asset status to available" do
      result
      expect(asset.reload.status).to eq("assigned")
    end
  end

  describe "mid-chain failure — already returned" do
    let!(:log) { create(:asset_assignment_log, asset: asset, returned_at: 1.day.ago) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes the already-returned message" do
      expect(result.message).to include("already been returned")
    end

    it "rolls back — no AuditLog created" do
      expect { result }.not_to change(AuditLog, :count)
    end
  end
end
