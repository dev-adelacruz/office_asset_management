# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::EvaluateAssetAvailabilityInteractor do
  let!(:asset) { create(:asset) }

  subject(:result) { described_class.call(asset: asset, assignment_log: log) }

  describe "when the current log is the only open assignment" do
    let!(:log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }

    it "succeeds" do
      expect(result).to be_success
    end

    it "sets all_returned to true" do
      expect(result.all_returned).to be true
    end
  end

  describe "when other open assignments still exist" do
    let!(:log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }
    let!(:other_open_log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }

    it "sets all_returned to false" do
      expect(result.all_returned).to be false
    end
  end

  describe "when all other assignments have been returned" do
    let!(:log) { create(:asset_assignment_log, asset: asset, returned_at: nil) }
    let!(:returned_log) { create(:asset_assignment_log, asset: asset, returned_at: 1.day.ago) }

    it "sets all_returned to true" do
      expect(result.all_returned).to be true
    end
  end
end
