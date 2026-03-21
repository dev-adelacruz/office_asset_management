Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins Rails.env.production? ? ENV.fetch("FRONTEND_URL") : /\Ahttp:\/\/localhost(:\d+)?\z/
    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head],
             expose: [ :Authorization ]
  end
end
