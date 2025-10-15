import React, { useMemo, useRef, useState, useEffect } from "react";
import * as QRCode from "qrcode";
import * as htmlToImage from "html-to-image";

// MUI
import {
  Box,
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Stack,
  Link,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const initialForm = {
  payee: "",
  amount: "",
  token: "STRK",
  network: "starknet-mainnet",
  txInput: "",
  note: "",
};

const isHex = (s) => /^0x[0-9a-fA-F]+$/.test(s?.trim() || "");
const extractHash = (input) => {
  if (!input) return "";
  const t = input.trim();
  if (isHex(t)) return t;
  try {
    const u = new URL(t);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    if (isHex(last)) return last;
  } catch {}
  return "";
};
const explorerLinks = (hash, network) => {
  if (!hash) return { voyager: "", starkscan: "" };
  const isSepolia = network === "starknet-sepolia";
  const voyagerBase = isSepolia
    ? "https://sepolia.voyager.online"
    : "https://voyager.online";
  const starkscanBase = isSepolia
    ? "https://sepolia.starkscan.co"
    : "https://starkscan.co";
  return {
    voyager: `${voyagerBase}/tx/${hash}`,
    starkscan: `${starkscanBase}/tx/${hash}`,
  };
};

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [usd, setUsd] = useState("");
  const [usePrice, setUsePrice] = useState(false);
  const [receiptId] = useState(
    () => Math.random().toString(36).slice(2, 10).toUpperCase()
  );
  const createdAt = useMemo(() => new Date().toISOString(), []);
  const receiptRef = useRef(null);

  const hash = extractHash(form.txInput);
  const links = explorerLinks(hash, form.network);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const generateQR = async () => {
    const payload = {
      type: "crypto-receipt-viewer",
      v: 1,
      receiptId,
      createdAt,
      ...form,
      txHash: hash,
      explorers: links,
    };
    try {
      const text = JSON.stringify(payload);
      const url = await QRCode.toDataURL(text, { margin: 1, scale: 6 });
      setQrDataUrl(url);
    } catch (e) {
      alert("Failed to generate QR: " + e.message);
    }
  };

  const downloadPNG = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, {
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `receipt-${receiptId}.png`;
      a.click();
    } catch (e) {
      alert("Failed to export image: " + e.message);
    }
  };

  useEffect(() => {
    if (!usePrice || !form.token || !form.amount) {
      setUsd("");
      return;
    }
    const controller = new AbortController();
    const id =
      form.token.toLowerCase() === "strk" ? "starknet" : form.token.toLowerCase();
    (async () => {
      try {
        const r = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
          { signal: controller.signal }
        );
        if (r.ok) {
          const j = await r.json();
          const price = j?.[id]?.usd || 0;
          if (price) {
            const total = Number(form.amount || 0) * Number(price);
            setUsd(`≈ $${total.toFixed(2)} USD`);
          }
        }
      } catch {}
    })();
    return () => controller.abort();
  }, [usePrice, form.token, form.amount]);

  const reset = () => {
    setForm(initialForm);
    setQrDataUrl("");
    setUsd("");
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h4" fontWeight={700}>
          Crypto Receipt <Typography component="span" color="primary">Viewer</Typography>
        </Typography>
        <Typography color="text.secondary">
          Read-only Starknet transaction receipt (QR + Explorer links)
        </Typography>
      </Box>

      {/* Form Card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Receipt Details
          </Typography>

          <Stack spacing={2} alignItems="stretch">
            <TextField
              label="Payee / Merchant"
              name="payee"
              value={form.payee}
              onChange={handleChange}
              placeholder="Name or wallet (optional)"
              fullWidth
            />

            <TextField
              label="Token"
              name="token"
              value={form.token}
              onChange={handleChange}
              placeholder="STRK/ETH/USDC"
              fullWidth
            />

            <TextField
              label="Amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              inputProps={{ inputMode: "decimal" }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="network-label">Network</InputLabel>
              <Select
                labelId="network-label"
                label="Network"
                name="network"
                value={form.network}
                onChange={handleChange}
              >
                <MenuItem value="starknet-mainnet">Starknet Mainnet</MenuItem>
                <MenuItem value="starknet-sepolia">Starknet Sepolia</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Tx Hash or Explorer URL"
              name="txInput"
              value={form.txInput}
              onChange={handleChange}
              placeholder="0xabc... or voyager/starkscan link"
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={usePrice}
                  onChange={(e) => setUsePrice(e.target.checked)}
                />
              }
              label="Show USD estimate (optional)"
            />
          </Stack>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }} justifyContent="center">
            <Button variant="contained" onClick={generateQR}>
              Generate
            </Button>
            <Button variant="outlined" onClick={reset}>
              Reset
            </Button>
          </Stack>
        </CardActions>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Preview
          </Typography>

          <Box
            ref={receiptRef}
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography fontWeight={700}>CR•V</Typography>
              <Typography variant="caption" color="text.secondary">
                #{receiptId}
              </Typography>
            </Stack>

            <Stack spacing={0.5} sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>Payee:</strong> {form.payee || "—"}
              </Typography>
              <Typography variant="body2">
                <strong>Amount:</strong> {form.amount || "—"} {form.token}{" "}
                {usd && (
                  <Typography component="span" variant="body2" color="text.secondary">
                    {usd}
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2">
                <strong>Network:</strong> {form.network.replace("-", " ")}
              </Typography>
            </Stack>

            <Divider sx={{ my: 1 }} />

            {hash ? (
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Link href={links.voyager} target="_blank" rel="noreferrer" underline="hover">
                  Open in Voyager <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
                <Link href={links.starkscan} target="_blank" rel="noreferrer" underline="hover">
                  Open in Starkscan <OpenInNewIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Add a tx hash to enable explorer links
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 1,
                minHeight: 170,
              }}
            >
              {qrDataUrl ? (
                <Box
                  component="img"
                  src={qrDataUrl}
                  alt="QR"
                  sx={{ width: 170, height: 170 }}
                />
              ) : (
                <Box
                  sx={{
                    width: 170,
                    height: 170,
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    color: "text.disabled",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  QR appears here
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>

        <CardActions sx={{ pb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadPNG}
              disabled={!qrDataUrl}
            >
              Download PNG
            </Button>
          </Stack>
        </CardActions>
      </Card>

      <Box textAlign="center" mt={2}>
        <Typography variant="caption" color="text.secondary">
          Always verify recipient address & amount on the explorer.
        </Typography>
      </Box>
    </Container>
  );
}
