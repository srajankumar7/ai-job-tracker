const pdfParse = require("pdf-parse");
const { protect } = require("../middleware/auth");
const User = require("../models/User");

module.exports = async function (fastify) {
  fastify.post(
    "/upload",
    { preHandler: protect },
    async (request, reply) => {
      try {
        const file = await request.file();
        if (!file) {
          return reply.code(400).send({ error: "No file uploaded" });
        }

        const buffer = await file.toBuffer();
        const parsed = await pdfParse(buffer);

        if (!parsed.text || !parsed.text.trim()) {
          return reply.code(400).send({ error: "Resume text not extracted" });
        }

        const user = await User.findById(request.user._id);

        // overwrite every time → update works
        user.resume = {
          originalName: file.filename,
          text: parsed.text.trim(),
          uploadedAt: new Date(),
        };

        await user.save();

        reply.send({
          success: true,
          message: "Resume uploaded successfully",
        });
      } catch (err) {
        console.error(err);
        reply.code(500).send({ error: "Resume upload failed" });
      }
    }
  );
};
