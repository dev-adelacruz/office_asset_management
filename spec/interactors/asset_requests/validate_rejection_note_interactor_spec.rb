# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequests::ValidateRejectionNoteInteractor do
  subject(:result) { described_class.call(rejection_note: note) }

  describe "present note" do
    let(:note) { "Missing supporting documentation." }

    it "succeeds" do
      expect(result).to be_success
    end
  end

  describe "blank note" do
    let(:note) { "" }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a relevant message" do
      expect(result.message).to include("Notes is required")
    end
  end

  describe "nil note" do
    let(:note) { nil }

    it "fails the context" do
      expect(result).to be_failure
    end

    it "includes a relevant message" do
      expect(result.message).to include("Notes is required")
    end
  end
end
