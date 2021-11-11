cd example-guardian
echo "starting guardian"
node -r ts-node/register/transpile-only ../../guardian-cli/index.ts --config=./config.yaml