# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::ReturnAssignmentLogUsecase do
  let!(:asset) { create(:asset, status: :assigned) }

  subject(:result) { described_class.call(asset: asset, assignment_log: log) }

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
  end
end
