# frozen_string_literal: true

require "rails_helper"

RSpec.describe Asset do
  describe "validations" do
    subject { build(:asset) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:category) }
    it { is_expected.to validate_presence_of(:serial_number) }
    it { is_expected.to validate_uniqueness_of(:serial_number) }
    it { is_expected.to validate_presence_of(:purchase_date) }
    it { is_expected.to validate_presence_of(:purchase_cost) }
    it { is_expected.to validate_numericality_of(:purchase_cost).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_presence_of(:condition) }
    it { is_expected.to validate_uniqueness_of(:asset_code) }
  end

  describe "associations" do
    it { is_expected.to have_many(:asset_status_logs).dependent(:destroy) }
    it { is_expected.to have_many(:asset_assignment_logs).dependent(:destroy) }
  end

  describe "enums" do
    it {
      is_expected.to define_enum_for(:category)
        .with_values(laptop: "laptop", monitor: "monitor", peripheral: "peripheral", furniture: "furniture", other: "other")
        .backed_by_column_of_type(:string)
    }

    it {
      is_expected.to define_enum_for(:status)
        .with_values(available: "available", assigned: "assigned", under_maintenance: "under_maintenance", retired: "retired", lost: "lost")
        .backed_by_column_of_type(:string)
    }

    it {
      is_expected.to define_enum_for(:condition)
        .with_values(brand_new: "new", good: "good", fair: "fair", poor: "poor")
        .backed_by_column_of_type(:string)
    }
  end

  describe "#generate_asset_code" do
    it "auto-generates an asset_code before create" do
      asset = create(:asset)
      expect(asset.asset_code).to match(/\AASSET-[A-Z0-9]{6}\z/)
    end

    it "generates a unique asset_code" do
      assets = create_list(:asset, 3)
      codes = assets.map(&:asset_code)
      expect(codes.uniq.length).to eq(3)
    end
  end
end
