# frozen_string_literal: true

require "rails_helper"

RSpec.describe AssetRequest do
  describe "validations" do
    it { is_expected.to validate_presence_of(:asset_type) }
    it { is_expected.to validate_inclusion_of(:asset_type).in_array(%w[physical software]) }
    it { is_expected.to validate_presence_of(:justification) }
    it { is_expected.to validate_presence_of(:urgency) }
    it { is_expected.to validate_inclusion_of(:urgency).in_array(%w[low medium high]) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_inclusion_of(:status).in_array(%w[pending approved rejected]) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:asset_request_status_logs).dependent(:destroy) }
  end

  describe "constants" do
    it "defines valid asset types" do
      expect(described_class::ASSET_TYPES).to eq(%w[physical software])
    end

    it "defines valid urgencies" do
      expect(described_class::URGENCIES).to eq(%w[low medium high])
    end

    it "defines valid statuses" do
      expect(described_class::STATUSES).to eq(%w[pending approved rejected])
    end
  end

  include_examples "auditable" do
    let(:auditable_update_attrs) { { status: "approved" } }
  end
end
