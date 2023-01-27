global.configureInstrumentations = () => {
  const { DnsInstrumentation } = require('@opentelemetry/instrumentation-dns')
  const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
  const { NetInstrumentation } = require('@opentelemetry/instrumentation-net')
  const {
    RemixInstrumentation,
  } = require('opentelemetry-instrumentation-remix')

  return [
    new DnsInstrumentation(),
    new HttpInstrumentation(),
    new NetInstrumentation(),
    new RemixInstrumentation(),
  ]
}
