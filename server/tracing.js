const { RemixInstrumentation } = require('opentelemetry-instrumentation-remix')
const { registerInstrumentations } = require('@opentelemetry/instrumentation')
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto')
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base')

const instrumentations = [new RemixInstrumentation()]

console.log('Registering Remix instrumentation')
registerInstrumentations({ instrumentations })

// FIXME: remove and replace with configureInstrumentations.
// See https://github.com/open-telemetry/opentelemetry-lambda/pull/435
global.configureTracerProvider = (tracerProvider) => {
  console.log('Registering Remix instrumentation with tracer')
  tracerProvider.addSpanProcessor(
    new BatchSpanProcessor(new OTLPTraceExporter())
  )
  registerInstrumentations({ instrumentations, tracerProvider })
}
