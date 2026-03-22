# frozen_string_literal: true

require "rails_helper"

RSpec.describe Assets::ValidateReturnParamsInteractor do
  subject(:result) { described_class.call(assignment_log: log) }

  describe "when the assignment has not been returned" do
    let(:log) { create(:asset_assignment_log, returned_at: nil) }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "when the assignment has already been returned" do
    let(:log) { create(:asset_assignment_log, returned_at: 1.day.ago) }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes the already-returned message" do
      expect(result.message).to include("already been returned")
    end
  end
end
