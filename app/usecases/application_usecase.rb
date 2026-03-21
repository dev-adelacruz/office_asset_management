# frozen_string_literal: true

class ApplicationUsecase
  include Interactor::Organizer

  def run!
    ActiveRecord::Base.transaction(requires_new: true) do
      super
    end
  end
end
